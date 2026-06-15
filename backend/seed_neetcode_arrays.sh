#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Seed: NeetCode – Arrays & Hashing sheet
# Usage:  ./seed_neetcode_arrays.sh [BASE_URL] [ADMIN_TOKEN]
#   BASE_URL     defaults to http://localhost:5001
#   ADMIN_TOKEN  JWT cookie value (ACCESS_TOKEN) of an admin user
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${1:-http://localhost:5001}"
TOKEN="${2:-eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTIxY2JjMC0xMGYzLTQwOGQtYjA4NS04OTVlOTIwZGY5NjgiLCJzdWIiOiJyb3lpbmZvMjlAZ21haWwuY29tIiwicm9sZXMiOlsiQURNSU4iXSwiaWF0IjoxNzgxNTQ5OTU1LCJleHAiOjE3ODE1NTM1NTV9.X6O89FmZYF-wxcOVrT9j68ijn-twUlBtckrfczhmgmQ}"
SHEET="NeetCode 150 – Arrays & Hashing"

if [[ -z "$TOKEN" ]]; then
  echo "Usage: $0 <base_url> <admin_jwt_token>"
  exit 1
fi

post() {
  local title="$1"
  local body="$2"
  echo -n "  Inserting: $title ... "
  STATUS=$(curl -s -o /tmp/seed_resp.json -w "%{http_code}" \
    -X POST "$BASE_URL/api/problems" \
    -H "Content-Type: application/json" \
    -H "Cookie: ACCESS_TOKEN=$TOKEN" \
    -d "$body")
  if [[ "$STATUS" == "200" || "$STATUS" == "201" ]]; then
    echo "✓ ($STATUS)"
  else
    echo "✗ ($STATUS) — $(cat /tmp/seed_resp.json)"
  fi
}

echo "Seeding '$SHEET' → $BASE_URL"
echo "──────────────────────────────────────────────"

# ── 1. Contains Duplicate ──────────────────────────────────────────────────
post "Contains Duplicate" '{
  "title": "Contains Duplicate",
  "difficulty": "EASY",
  "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
  "constraints": "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "1 2 3 1",  "expectedOutput": "true",  "isSample": true},
    {"inputData": "1 2 3 4",  "expectedOutput": "false", "isSample": true},
    {"inputData": "1 1 1 3 3 4 3 2 4 2", "expectedOutput": "true", "isSample": false}
  ]
}'

# ── 2. Valid Anagram ───────────────────────────────────────────────────────
post "Valid Anagram" '{
  "title": "Valid Anagram",
  "difficulty": "EASY",
  "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
  "constraints": "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "anagram\nnagaram", "expectedOutput": "true",  "isSample": true},
    {"inputData": "rat\ncar",         "expectedOutput": "false", "isSample": true},
    {"inputData": "a\nab",            "expectedOutput": "false", "isSample": false}
  ]
}'

# ── 3. Two Sum ────────────────────────────────────────────────────────────
post "Two Sum" '{
  "title": "Two Sum",
  "difficulty": "EASY",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nReturn the answer in any order.",
  "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "2 7 11 15\n9",  "expectedOutput": "0 1", "isSample": true},
    {"inputData": "3 2 4\n6",      "expectedOutput": "1 2", "isSample": true},
    {"inputData": "3 3\n6",        "expectedOutput": "0 1", "isSample": false}
  ]
}'

# ── 4. Group Anagrams ─────────────────────────────────────────────────────
post "Group Anagrams" '{
  "title": "Group Anagrams",
  "difficulty": "MEDIUM",
  "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
  "constraints": "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 3000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "eat tea tan ate nat bat", "expectedOutput": "[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]", "isSample": true},
    {"inputData": "",                        "expectedOutput": "[[\"\"]]",                                       "isSample": true},
    {"inputData": "a",                       "expectedOutput": "[[\"a\"]]",                                     "isSample": false}
  ]
}'

# ── 5. Top K Frequent Elements ────────────────────────────────────────────
post "Top K Frequent Elements" '{
  "title": "Top K Frequent Elements",
  "difficulty": "MEDIUM",
  "description": "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
  "constraints": "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nk is in the range [1, the number of unique elements in the array].\nIt is guaranteed that the answer is unique.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 3000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "1 1 1 2 2 3\n2", "expectedOutput": "1 2", "isSample": true},
    {"inputData": "1\n1",           "expectedOutput": "1",   "isSample": true},
    {"inputData": "4 1 1 1 2 2 3\n2", "expectedOutput": "1 2", "isSample": false}
  ]
}'

# ── 6. Encode and Decode Strings ──────────────────────────────────────────
post "Encode and Decode Strings" '{
  "title": "Encode and Decode Strings",
  "difficulty": "MEDIUM",
  "description": "Design an algorithm to encode a list of strings to a single string. The encoded string is then sent over the network and is decoded back to the original list of strings.\nPlease implement encode and decode methods.\nYour solve() method should accept a newline-separated list of strings and return them back in the same format after encoding and decoding.",
  "constraints": "0 <= strs.length < 100\n0 <= strs[i].length < 200\nstrs[i] contains any possible characters out of the 256 valid ASCII characters.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "lint\ncode\nlove\nyou", "expectedOutput": "lint\ncode\nlove\nyou", "isSample": true},
    {"inputData": "we\nsay\n:\nyes",       "expectedOutput": "we\nsay\n:\nyes",       "isSample": true}
  ]
}'

# ── 7. Product of Array Except Self ──────────────────────────────────────
post "Product of Array Except Self" '{
  "title": "Product of Array Except Self",
  "difficulty": "MEDIUM",
  "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
  "constraints": "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 3000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "1 2 3 4",      "expectedOutput": "24 12 8 6", "isSample": true},
    {"inputData": "-1 1 0 -3 3",  "expectedOutput": "0 0 9 0 0", "isSample": true},
    {"inputData": "2 3 4",        "expectedOutput": "12 8 6",    "isSample": false}
  ]
}'

# ── 8. Valid Sudoku ───────────────────────────────────────────────────────
post "Valid Sudoku" '{
  "title": "Valid Sudoku",
  "difficulty": "MEDIUM",
  "description": "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n1. Each row must contain the digits 1-9 without repetition.\n2. Each column must contain the digits 1-9 without repetition.\n3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.\nNote: A Sudoku board (partially filled) could be valid but is not necessarily solvable. Only the filled cells need to be validated.\nInput is 9 lines, each with 9 space-separated values where '.' means empty.",
  "constraints": "board.length == 9\nboard[i].length == 9\nboard[i][j] is a digit 1-9 or '.'.",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 3000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9", "expectedOutput": "true",  "isSample": true},
    {"inputData": "8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9", "expectedOutput": "false", "isSample": true}
  ]
}'

# ── 9. Longest Consecutive Sequence ──────────────────────────────────────
post "Longest Consecutive Sequence" '{
  "title": "Longest Consecutive Sequence",
  "difficulty": "MEDIUM",
  "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\nYou must write an algorithm that runs in O(n) time.",
  "constraints": "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
  "sheetName": "'"$SHEET"'",
  "timeLimit": 3000,
  "memoryLimit": 256,
  "testCases": [
    {"inputData": "100 4 200 1 3 2", "expectedOutput": "4", "isSample": true},
    {"inputData": "0 3 7 2 5 8 4 6 0 1", "expectedOutput": "9", "isSample": true},
    {"inputData": "",                     "expectedOutput": "0", "isSample": false}
  ]
}'

echo ""
echo "Done! Check http://localhost:5173/problems to verify."
