import unittest
from datetime import datetime

from app.core.datetime_utils import format_ist, ist_date_yyyymmdd, utc_iso_z


class DatetimeUtilsIstTests(unittest.TestCase):
    def test_format_ist_from_utc_naive(self) -> None:
        # 2026-07-06 01:11:34 UTC -> 6:41:34 AM IST
        label = format_ist(datetime(2026, 7, 6, 1, 11, 34))
        self.assertIn("6 Jul 2026", label)
        self.assertIn("6:41", label)
        self.assertTrue(label.endswith("IST"))

    def test_ist_job_id_date_rolls_on_ist_midnight(self) -> None:
        # 2026-07-06 20:30 UTC = 2026-07-07 02:00 IST
        self.assertEqual(ist_date_yyyymmdd(datetime(2026, 7, 6, 20, 30, 0)), "20260707")

    def test_utc_iso_z_suffix(self) -> None:
        self.assertEqual(utc_iso_z(datetime(2026, 7, 6, 1, 11, 34)), "2026-07-06T01:11:34Z")


if __name__ == "__main__":
    unittest.main()
