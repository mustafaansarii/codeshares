#!/usr/bin/env python3
"""
Seed NeetCode 150 – Arrays & Hashing problems.
Usage: python3 seed_neetcode.py <base_url> <ACCESS_TOKEN>
"""
import sys, json
import urllib.request, urllib.error

BASE  = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
TOKEN = sys.argv[2] if len(sys.argv) > 2 else "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTIxY2JjMC0xMGYzLTQwOGQtYjA4NS04OTVlOTIwZGY5NjgiLCJzdWIiOiJyb3lpbmZvMjlAZ21haWwuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzgxNTQ5OTU1LCJleHAiOjE3ODE1NTM1NTV9.X6O89FmZYF-wxcOVrT9j68ijn-twUlBtckrfczhmgmQ"
SHEET = "NeetCode 150 – Arrays & Hashing"

if not TOKEN:
    print("Usage: python3 seed_neetcode.py <base_url> <ACCESS_TOKEN>"); sys.exit(1)

def tc(inp, out, sample=False):
    return {"input_data": inp, "expected_output": out, "is_sample": sample}

PROBLEMS = [
  {
    "title": "Contains Duplicate",
    "difficulty": "EASY",
    "description": "Given an integer array nums, return true if any value appears at least twice, false if every element is distinct.",
    "constraints": "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    "time_limit": 2000, "memory_limit": 256,
    "testCases": [
      tc("1 2 3 1",                   "true",  True),
      tc("1 2 3 4",                   "false", True),
      tc("1 1 1 3 3 4 3 2 4 2",       "true",  True),
      tc("1",                          "false", True),
      tc("0 0",                        "true",  True),
      tc("-1 -2 -3 -1",               "true",  True),
      tc("1 2 3 4 5 6 7 8 9 10",      "false", True),
      tc("2 2",                        "true",  True),
      tc("100 200 300",               "false", True),
      tc("7 7 7 7",                   "true",  True),
      tc("1 2 3 4 5 5",              "true",  False),
      tc("10 20 30 40 50",           "false", False),
      tc("0 1 2 3 4 5 0",            "true",  False),
      tc("-1 -1",                     "true",  False),
      tc("1 2 3 4 5 6 7 8 9",        "false", False),
      tc("3 1 4 1 5 9 2 6",          "true",  False),
      tc("5 6 7 8 9 10",             "false", False),
      tc("1000000000 -1000000000",   "false", False),
      tc("-5 -4 -3 -2 -1 0 1 2 3 4 5","false",False),
      tc("4 4 4 4 4",               "true",  False),
    ]
  },
  {
    "title": "Valid Anagram",
    "difficulty": "EASY",
    "description": "Given two strings s and t (one per line), return true if t is an anagram of s, false otherwise.",
    "constraints": "1 <= s.length, t.length <= 5*10^4\nLowercase English letters.",
    "time_limit": 2000, "memory_limit": 256,
    "testCases": [
      tc("anagram\nnagaram",  "true",  True),
      tc("rat\ncar",          "false", True),
      tc("listen\nsilent",    "true",  True),
      tc("hello\nworld",      "false", True),
      tc("a\na",              "true",  True),
      tc("ab\nba",            "true",  True),
      tc("ab\nabc",           "false", True),
      tc("aab\nbaa",          "true",  True),
      tc("abc\ncba",          "true",  True),
      tc("noon\nno",          "false", True),
      tc("dusty\nstudy",      "true",  False),
      tc("cinema\niceman",    "true",  False),
      tc("triangle\nintegral","true",  False),
      tc("cat\tact",          "true",  False),
      tc("xyz\nzyx",          "true",  False),
      tc("a\nab",             "false", False),
      tc("aab\naab",          "true",  False),
      tc("aacc\nccac",        "false", False),
      tc("abcde\nedcba",      "true",  False),
      tc("ab\naa",            "false", False),
    ]
  },
  {
    "title": "Two Sum",
    "difficulty": "EASY",
    "description": "Given an array of integers nums (first line) and target (second line), return space-separated indices of two numbers that add up to target.",
    "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one solution.",
    "time_limit": 2000, "memory_limit": 256,
    "testCases": [
      tc("2 7 11 15\n9",    "0 1", True),
      tc("3 2 4\n6",         "1 2", True),
      tc("3 3\n6",           "0 1", True),
      tc("1 2 3 4 5\n9",    "3 4", True),
      tc("0 4 3 0\n0",       "0 3", True),
      tc("5 1 7 2 4\n6",    "0 1", True),
      tc("-3 4 3 90\n0",    "0 2", True),
      tc("1 0 -1\n-1",      "1 2", True),
      tc("2 5 5 1\n10",     "1 2", True),
      tc("1 9 3 8 2 7\n10", "0 1", True),
      tc("100 200 300 400\n700", "2 3", False),
      tc("-1 -2 -3 -4 -5\n-8",  "2 4", False),
      tc("1 2 3 4 5 6 7 8 9\n17","7 8", False),
      tc("0 0\n0",               "0 1", False),
      tc("-10 5 7 -5\n-15",      "0 3", False),
      tc("11 15 2 7\n9",         "2 3", False),
      tc("1 3 5 7 9\n12",        "2 3", False),
      tc("5 5\n10",              "0 1", False),
      tc("4 6 8 2\n10",          "0 1", False),
      tc("1 2 3 4 6\n6",         "1 3", False),
    ]
  },
  {
    "title": "Top K Frequent Elements",
    "difficulty": "MEDIUM",
    "description": "First line: space-separated integers nums. Second line: integer k. Return k most frequent elements as space-separated integers (in any order, but output them sorted ascending).",
    "constraints": "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\n1 <= k <= unique elements.",
    "time_limit": 3000, "memory_limit": 256,
    "testCases": [
      tc("1 1 1 2 2 3\n2",       "1 2", True),
      tc("1\n1",                  "1",   True),
      tc("4 1 1 2 2 3\n2",       "1 2", True),
      tc("1 2 3 4\n4",           "1 2 3 4", True),
      tc("5 5 5 5\n1",           "5",   True),
      tc("1 1 2 2 3\n1",         "1 2", True),
      tc("3 0 1 0\n1",           "0",   True),
      tc("7 7 7 8 8 9\n2",       "7 8", True),
      tc("1 2 2 3 3 3\n2",       "2 3", True),
      tc("-1 -1 2 2 3\n2",       "-1 2",True),
      tc("1 1 2 2 2 3 3 3 3\n2", "2 3", False),
      tc("10 10 20 30 10\n1",    "10",  False),
      tc("5 4 3 2 1 5 4 3 5\n2", "3 5", False),
      tc("-3 -3 -2 -1\n1",       "-3",  False),
      tc("1 1 1 2 2 3 3 4\n3",   "1 2 3",False),
      tc("0 0 0 0 1 1 1 2 2\n2", "0 1", False),
      tc("6 6 6 7 7 8\n2",       "6 7", False),
      tc("1 2 3\n3",             "1 2 3",False),
      tc("9 9 8 8 7 7 6\n3",     "7 8 9",False),
      tc("100 100 200 200 300\n2","100 200",False),
    ]
  },
  {
    "title": "Product of Array Except Self",
    "difficulty": "MEDIUM",
    "description": "Given an integer array nums (space-separated), return an array where each element is the product of all other elements. Output space-separated.",
    "constraints": "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30",
    "time_limit": 3000, "memory_limit": 256,
    "testCases": [
      tc("1 2 3 4",       "24 12 8 6",    True),
      tc("-1 1 0 -3 3",   "0 0 9 0 0",   True),
      tc("2 3 4",         "12 8 6",       True),
      tc("1 1 1 1",       "1 1 1 1",      True),
      tc("1 2",           "2 1",          True),
      tc("3 3 3",         "9 9 9",        True),
      tc("0 0",           "0 0",          True),
      tc("-1 -2 -3",      "-6 3 -2",     True),
      tc("2 2 2 2",       "8 8 8 8",      True),
      tc("1 2 3",         "6 3 2",        True),
      tc("5 6 7 8",       "336 280 240 210",False),
      tc("0 1 2 3",       "6 0 0 0",     False),
      tc("1 0 0 1",       "0 0 0 0",     False),
      tc("-1 -1 -1 -1",   "−1 −1 −1 −1", False),
      tc("10 3 5 6 2",    "180 600 360 300 900",False),
      tc("1 2 3 4 5",     "120 60 40 30 24",False),
      tc("2 4 6",         "24 12 8",     False),
      tc("-2 3 -4",       "-12 8 -6",    False),
      tc("1 1 2 3",       "6 6 3 2",     False),
      tc("5 5",           "5 5",         False),
    ]
  },
  {
    "title": "Longest Consecutive Sequence",
    "difficulty": "MEDIUM",
    "description": "Given a space-separated list of unsorted integers, return the length of the longest consecutive elements sequence. O(n) required.",
    "constraints": "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    "time_limit": 3000, "memory_limit": 256,
    "testCases": [
      tc("100 4 200 1 3 2",         "4",  True),
      tc("0 3 7 2 5 8 4 6 0 1",    "9",  True),
      tc("",                        "0",  True),
      tc("1",                       "1",  True),
      tc("1 2 3 4 5",              "5",  True),
      tc("10 5 6 7",               "3",  True),
      tc("0 -1 1 2 -2",           "5",  True),
      tc("9 1 4 7 3 2",            "4",  True),
      tc("100 200 300",            "1",  True),
      tc("1 3 5 7 9",             "1",  True),
      tc("1 2 2 3",               "3",  False),
      tc("-1 0 1",                "3",  False),
      tc("5 4 3 2 1 10",          "5",  False),
      tc("0",                     "1",  False),
      tc("1 2 3 100 101 102 103", "4",  False),
      tc("4 0 2 -1 3 1 -2",      "7",  False),
      tc("10 20 30 11 12 21",     "3",  False),
      tc("1 1 1 1",              "1",  False),
      tc("50 1 2 3 4 5 49 48",   "8",  False),
      tc("7 8 9 10 11 12",       "6",  False),
    ]
  },
  {
    "title": "Valid Sudoku",
    "difficulty": "MEDIUM",
    "description": "Determine if a 9x9 Sudoku board is valid. Input: 9 lines each with 9 space-separated values (digit 1-9 or '.' for empty). Output: true or false.",
    "constraints": "board[i][j] is a digit 1-9 or '.'",
    "time_limit": 3000, "memory_limit": 256,
    "testCases": [
      tc("5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9","true", True),
      tc("8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9","false",True),
      tc(". . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","true", True),
      tc("1 . . . . . . . .\n. 2 . . . . . . .\n. . 3 . . . . . .\n. . . 4 . . . . .\n. . . . 5 . . . .\n. . . . . 6 . . .\n. . . . . . 7 . .\n. . . . . . . 8 .\n. . . . . . . . 9","true", True),
      tc("1 1 . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",True),
      tc(". . . . . . . . 1\n. . . . . . . 2 .\n. . . . . . 3 . .\n. . . . . 4 . . .\n. . . . 5 . . . .\n. . . 6 . . . . .\n. . 7 . . . . . .\n. 8 . . . . . . .\n9 . . . . . . . .","true", True),
      tc("1 2 3 4 5 6 7 8 9\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","true", True),
      tc("1 2 3 4 5 6 7 8 1\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",True),
      tc("5 . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . 5 . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","true", True),
      tc("1 . . . . . . . .\n1 . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",True),
      tc("2 . . . . . . . .\n. 2 . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
      tc("1 2 3 . . . . . .\n4 5 6 . . . . . .\n7 8 9 . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","true", False),
      tc(". . . 1 . . . . .\n. . . 1 . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
      tc("9 . . . . . . . .\n. 9 . . . . . . .\n. . 9 . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
      tc(". . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . 1 . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . 1 . . . .","false",False),
      tc("1 . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . 2 . . . . .\n. . . . 3 . . . .\n. . . . . 4 . . .\n. . . . . . 5 . .\n. . . . . . . 6 .\n. . . . . . . . 7","true", False),
      tc("7 . . . . . . . 7\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
      tc(". . . . . . . . .\n. . . . . . . . .\n. . 1 . . . . . .\n. . 1 . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
      tc("5 1 9 . . . . . .\n2 . . . . . . . .\n8 . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","true", False),
      tc("3 . . . . . . . .\n. . . . . . . . .\n3 . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .\n. . . . . . . . .","false",False),
    ]
  },
  {
    "title": "Group Anagrams",
    "difficulty": "MEDIUM",
    "description": "Given space-separated words, group anagrams together. Output each group's words sorted alphabetically and joined by commas, groups sorted by their first word, separated by '|'.",
    "constraints": "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100",
    "time_limit": 3000, "memory_limit": 256,
    "testCases": [
      tc("eat tea tan ate nat bat", "ate,eat,tea|bat|nat,tan", True),
      tc("a",                       "a",                       True),
      tc("abc bca cab",             "abc,bca,cab",             True),
      tc("ab ba",                   "ab,ba",                   True),
      tc("dog god",                 "dog,god",                 True),
      tc("abc def",                 "abc|def",                 True),
      tc("a b c",                   "a|b|c",                   True),
      tc("aab baa aba",             "aab,aba,baa",             True),
      tc("rat tar art",             "art,rat,tar",             True),
      tc("abc",                     "abc",                     True),
      tc("tea eat",                 "eat,tea",                 False),
      tc("abc bca xyz",             "abc,bca|xyz",             False),
      tc("ab ba abc",               "ab,ba|abc",               False),
      tc("a aa aaa",                "a|aa|aaa",                False),
      tc("listen silent",           "listen,silent",           False),
      tc("cat act tac",             "act,cat,tac",             False),
      tc("abc cba bac xyz",         "abc,bac,cba|xyz",         False),
      tc("ab cd ba dc",             "ab,ba|cd,dc",             False),
      tc("the",                     "the",                     False),
      tc("no on noon",              "no,on|noon",              False),
    ]
  },
  {
    "title": "Encode and Decode Strings",
    "difficulty": "MEDIUM",
    "description": "Implement encode and decode for a list of strings. Your solve() receives newline-separated strings and must return the same strings newline-separated after encoding and decoding.",
    "constraints": "0 <= strs.length < 100\n0 <= strs[i].length < 200",
    "time_limit": 2000, "memory_limit": 256,
    "testCases": [
      tc("lint\ncode\nlove\nyou", "lint\ncode\nlove\nyou", True),
      tc("we\nsay\n:\nyes",       "we\nsay\n:\nyes",       True),
      tc("hello\nworld",         "hello\nworld",           True),
      tc("a\nb\nc",              "a\nb\nc",                True),
      tc("foo\nbar\nbaz",        "foo\nbar\nbaz",          True),
      tc("one",                  "one",                    True),
      tc("a\n",                  "a\n",                    True),
      tc("abc\ndef\nghi",        "abc\ndef\nghi",          True),
      tc("x\ny\nz",              "x\ny\nz",                True),
      tc("hello",               "hello",                  True),
      tc("a\nb",                "a\nb",                   False),
      tc("test\ncase\nhere",    "test\ncase\nhere",        False),
      tc("1\n2\n3",             "1\n2\n3",                 False),
      tc("ab\ncd\nef",          "ab\ncd\nef",              False),
      tc("p\nq",                "p\nq",                    False),
      tc("foo",                 "foo",                     False),
      tc("a\na\na",             "a\na\na",                 False),
      tc("str1\nstr2\nstr3",    "str1\nstr2\nstr3",        False),
      tc("end\nto\nend",        "end\nto\nend",            False),
      tc("hello\nworld\n!",     "hello\nworld\n!",         False),
    ]
  },
]

def post_problem(p):
    url = f"{BASE}/api/problems"
    data = json.dumps(p).encode()
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "Cookie": f"ACCESS_TOKEN={TOKEN}"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  ✓ {p['title']} ({r.status})")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ✗ {p['title']} ({e.code}) → {body[:120]}")

print(f"Seeding {len(PROBLEMS)} problems → {BASE}")
print("─" * 50)
for prob in PROBLEMS:
    prob["sheet_name"] = SHEET
    post_problem(prob)
print("\nDone! Visit http://localhost:5173/problems")
