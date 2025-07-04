"""
Custom Python Utils 
"""

from sys import exit, stderr
from typing import NoReturn

def EXIT(msg: str, status_code) -> NoReturn:
    if status_code == 0:
        print(msg)
    else:
        print(msg, file=stderr)
    exit(status_code)


def prompt_yn(msg: str) -> bool:
    while True:
        res = input(msg)
        if res in ["y", "yes"]:
            return True
        if res in ["n", "no"]:
            return False

