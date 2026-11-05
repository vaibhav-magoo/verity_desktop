using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace VerityLauncher
{
    static class Program
    {
        #region Windows Job Object (Guarantees zero orphaned child processes on exit)
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        static extern IntPtr CreateJobObject(IntPtr lpJobAttributes, string lpName);

        [DllImport("kernel32.dll")]
        static extern bool SetInformationJobObject(IntPtr hJob, int JobObjectInfoClass, IntPtr lpJobObjectInfo, uint cbJobObjectInfoLength);

        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool AssignProcessToJobObject(IntPtr hJob, IntPtr hProcess);

        const int JobObjectExtendedLimitInformation = 9;
        const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;

        [StructLayout(LayoutKind.Sequential)]
        struct IO_COUNTERS
        {
            public ulong ReadOperationCount;
            public ulong WriteOperationCount;
            public ulong OtherOperationCount;
            public ulong ReadTransferCount;
            public ulong WriteTransferCount;
            public ulong OtherTransferCount;
        }

        [StructLayout(LayoutKind.Sequential)]
        struct JOBOBJECT_BASIC_LIMIT_INFORMATION
        {
            public long PerProcessUserTimeLimit;
            public long PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize;
            public UIntPtr MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass;
            public uint SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
        {
            public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
            public IO_COUNTERS IoInfo;
            public UIntPtr ProcessMemoryLimit;
            public UIntPtr JobMemoryLimit;
            public UIntPtr PeakProcessMemoryLimit;
            public UIntPtr PeakJobMemoryLimit;
        }

        static IntPtr hJob = IntPtr.Zero;

        static void InitializeJobObject()
        {
            try
            {
                hJob = CreateJobObject(IntPtr.Zero, null);
                var info = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
                info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

                int length = Marshal.SizeOf(typeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));
                IntPtr extendedInfoPtr = Marshal.AllocHGlobal(length);
                try
                {
                    Marshal.StructureToPtr(info, extendedInfoPtr, false);
                    SetInformationJobObject(hJob, JobObjectExtendedLimitInformation, extendedInfoPtr, (uint)length);
                }
                finally
                {
                    Marshal.FreeHGlobal(extendedInfoPtr);
                }
            }
            catch { }
        }

        static void AttachProcessToJob(Process p)
        {
            if (hJob != IntPtr.Zero && p != null && !p.HasExited)
            {
                try
                {
                    AssignProcessToJobObject(hJob, p.Handle);
                }
                catch { }
            }
        }
        #endregion

        static List<Process> spawnedProcesses = new List<Process>();

        static bool IsPortListening(int port)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect("127.0.0.1", port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(150);
                    if (success && client.Connected)
                    {
                        client.EndConnect(result);
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }

        static string FindExecutableInPath(string exeName)
        {
            string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
            string[] paths = pathEnv.Split(Path.PathSeparator);
            foreach (string p in paths)
            {
                try
                {
                    string full = Path.Combine(p.Trim(), exeName);
                    if (File.Exists(full)) return full;
                    if (File.Exists(full + ".exe")) return full + ".exe";
                }
                catch { }
            }
            return null;
        }

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            InitializeJobObject();

            string projectDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            // Handle CLI flags
            bool isStudio = true;
            bool noTts = false;
            string customGatewayUrl = null;

            for (int i = 0; i < args.Length; i++)
            {
                string arg = args[i].ToLowerInvariant();
                if (arg == "--studio" || arg == "-s") isStudio = true;
                else if (arg == "--overlay" || arg == "-o") isStudio = false;
                else if (arg == "--no-tts") noTts = true;
                else if ((arg == "--gateway" || arg == "-g") && i + 1 < args.Length)
                {
                    customGatewayUrl = args[++i];
                }
            }

            if (!string.IsNullOrEmpty(customGatewayUrl))
            {
                Environment.SetEnvironmentVariable("HERMES_GATEWAY_URL", customGatewayUrl);
            }

            // Register cleanup on app domain exit
            AppDomain.CurrentDomain.ProcessExit += (s, e) => CleanupProcesses();

            try
            {
                // STEP 1: Check and optionally launch Hermes Agent Gateway (Port 8642)
                bool hermesRunning = IsPortListening(8642);
                string hermesKey = Environment.GetEnvironmentVariable("HERMES_API_KEY");
                if (!hermesRunning && string.IsNullOrEmpty(hermesKey)) hermesKey = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                if (!hermesRunning)
                {
                    string hermesExe = Path.Combine(projectDir, ".venv", "Scripts", "hermes.exe");
                    string localAppHermes = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "hermes", "bin", "hermes.exe");
                    if (!File.Exists(hermesExe) && File.Exists(localAppHermes)) hermesExe = localAppHermes;
                    if (!File.Exists(hermesExe)) hermesExe = FindExecutableInPath("hermes");

                    if (!string.IsNullOrEmpty(hermesExe) && File.Exists(hermesExe))
                    {
                        try
                        {
                            var hermesStart = new ProcessStartInfo
                            {
                                FileName = hermesExe,
                                Arguments = "gateway run",
                                WorkingDirectory = projectDir,
                                UseShellExecute = false,
                                CreateNoWindow = true
                            };
                            hermesStart.EnvironmentVariables["API_SERVER_KEY"] = hermesKey;
                            var hermesProc = Process.Start(hermesStart);
                            if (hermesProc != null)
                            {
                                spawnedProcesses.Add(hermesProc);
                                AttachProcessToJob(hermesProc);
                            }
                        }
                        catch { }
                    }
                }

                // STEP 2: Check and launch Kokoro TTS Server (Port 5001)
                if (!noTts && !IsPortListening(5001))
                {
                    string pythonExe = Path.Combine(projectDir, ".venv", "Scripts", "python.exe");
                    string ttsScript = Path.Combine(projectDir, "services", "kokoro_tts_server.py");

                    if (File.Exists(pythonExe) && File.Exists(ttsScript))
                    {
                        try
                        {
                            var ttsStart = new ProcessStartInfo
                            {
                                FileName = pythonExe,
                                Arguments = "services\\kokoro_tts_server.py",
                                WorkingDirectory = projectDir,
                                UseShellExecute = false,
                                CreateNoWindow = true
                            };
                            var ttsProc = Process.Start(ttsStart);
                            if (ttsProc != null)
                            {
                                spawnedProcesses.Add(ttsProc);
                                AttachProcessToJob(ttsProc);
                            }
                        }
                        catch { }
                    }
                }

                // STEP 3: Launch Verity 3D Electron Desktop App
                string electronExe = Path.Combine(projectDir, "node_modules", "electron", "dist", "electron.exe");
                if (!File.Exists(electronExe))
                {
                    MessageBox.Show(
                        "Could not locate Electron in 'node_modules/electron/dist/electron.exe'.\nPlease run 'npm install' in this folder.",
                        "Verity Launch Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                string electronArgs = isStudio ? "." : ". --overlay";

                var electronStart = new ProcessStartInfo
                {
                    FileName = electronExe,
                    Arguments = electronArgs,
                    WorkingDirectory = projectDir,
                    UseShellExecute = false
                };

                // Propagate environment variables
                if (!string.IsNullOrEmpty(hermesKey)) electronStart.EnvironmentVariables["HERMES_API_KEY"] = hermesKey;
                if (!string.IsNullOrEmpty(customGatewayUrl))
                {
                    electronStart.EnvironmentVariables["HERMES_GATEWAY_URL"] = customGatewayUrl;
                }

                var electronProc = Process.Start(electronStart);
                if (electronProc != null)
                {
                    AttachProcessToJob(electronProc);
                    // Wait for the desktop UI window to exit
                    electronProc.WaitForExit();
                }
            }
            finally
            {
                CleanupProcesses();
            }
        }

        static void CleanupProcesses()
        {
            foreach (var p in spawnedProcesses)
            {
                try
                {
                    if (p != null && !p.HasExited)
                    {
                        p.Kill();
                    }
                }
                catch { }
            }
            spawnedProcesses.Clear();
        }
    }
}
