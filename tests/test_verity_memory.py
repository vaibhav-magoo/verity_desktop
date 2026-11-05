import tempfile
import unittest
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
from verity_memory import MemoryStore


class MemoryStoreTests(unittest.TestCase):
    def test_persistence_retrieval_budget_and_deletion(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'memory.sqlite'
            store = MemoryStore(path)
            first = store.add('The project is called Verity and uses a golden avatar.')
            store.add('A different topic about music.')
            store.relate('Verity', 'uses', 'golden avatar', first)
            store.close()
            store = MemoryStore(path)
            self.assertEqual(store.search('golden avatar')[0]['id'], first)
            self.assertLessEqual(sum(len(x['content']) for x in store.search('avatar', max_chars=8)), 8)
            self.assertEqual(store.neighbors('verity')[0]['object'], 'golden avatar')
            self.assertTrue(store.delete(first))
            self.assertEqual(store.search('golden avatar'), [])
            self.assertEqual(store.neighbors('verity'), [])
            store.close()

    def test_search_handles_punctuation_and_empty_input(self):
        with tempfile.TemporaryDirectory() as directory:
            store = MemoryStore(Path(directory) / 'memory.sqlite')
            store.add('A note about Verity')
            self.assertEqual(len(store.search('"Verity" OR (')), 1)
            self.assertEqual(store.search('!!!'), [])
            store.close()


if __name__ == '__main__':
    unittest.main()
