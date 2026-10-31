import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from base12 import SUBJECT, UNITS as U12, GLOSSARY as G12, QUIZ as Q12, FEEDBACK
from extra import UNITS_EXTRA, GLOSSARY_EXTRA, QUIZ_EXTRA
UNITS = U12 + UNITS_EXTRA
GLOSSARY = G12 + GLOSSARY_EXTRA
QUIZ = Q12 + QUIZ_EXTRA

# Mondatpárok, párbeszédek, szójegyzék (V3 design, 2026-10-27)
import os as _os
exec(open('/home/claude/subjects/tools/attach.py').read())
