#!/usr/bin/env bash

set -euo pipefail

command -v brew &> /dev/null && { brew update && brew upgrade; }
