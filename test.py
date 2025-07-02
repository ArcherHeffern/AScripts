from io import StringIO
from unittest import TestCase, main

from format_brackets import FileWriter


class FormatBracketsTests(TestCase):
    def test_format(self):  # test method names begin with 'test'
        from format_brackets import format_file
        
        text = """\
        ((hello))
        """

        expected = """\
(
\t(
\t\thello
\t)
)"""

        output_stringio = StringIO()
        out = FileWriter(output_stringio)
        format_file(StringIO(text), out, False)
        actual = output_stringio.getvalue()

        self.assertEqual(actual, expected)

if __name__ == '__main__':
        main()
