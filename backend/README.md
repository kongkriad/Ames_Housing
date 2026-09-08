
python -m venv .venv

Activate venv 

Windows PowerShell
    .venv\Scripts\Activate.ps1

Windows CMD
    .venv\Scripts\activate

macOS / Linux
    source .venv/bin/activate

install fastapi
    pip install "fastapi[standard]"

export package
pip freeze > requirements.txt

install package txt
    pip install -r requirements.txt

ปิด/ออกจาก .venv ที่กำลังใช้งานอยู่:
    deactivate