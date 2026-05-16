import os
import sys

# Add parent directory to sys.path so ml_models can be imported
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parent_dir = os.path.dirname(backend_dir)

if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
