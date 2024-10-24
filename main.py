from fastapi import FastAPI, Request, Form, File, UploadFile
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from PIL import Image, ImageDraw, ImageFont
import json
from datetime import datetime
import io

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Cargar la configuración
with open("receipt_config.json", "r") as f:
    config = json.load(f)

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate")
async def generate_receipt(
    request: Request,
    date: str = Form(...),
    receipt_number: str = Form(...),
    received_from: str = Form(...),
    amount: str = Form(...),
    payment_method: str = Form(...),
    concept: str = Form(...),
    saldo: str = Form(...)
):
    # Crear la imagen del recibo
    blank_receipt = Image.open("static/recibo_vacio.png")
    draw = ImageDraw.Draw(blank_receipt)

    for field, value in [("date", date), ("receipt_number", receipt_number), 
                         ("received_from", received_from), ("amount", amount), 
                         ("payment_method", payment_method), ("concept", concept), 
                         ("saldo", saldo)]:
        field_config = config.get(field, {"x": 100, "y": 100, "size": 12})
        font = ImageFont.truetype("arial.ttf", field_config["size"])
        draw.text((field_config["x"], field_config["y"]), value, font=font, fill=(0, 0, 0))

    # Guardar la imagen en memoria
    img_byte_arr = io.BytesIO()
    blank_receipt.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    # Guardar los datos del recibo
    receipt = {
        "date": date,
        "receipt_number": receipt_number,
        "received_from": received_from,
        "amount": amount,
        "payment_method": payment_method,
        "concept": concept,
        "saldo": saldo
    }

    try:
        with open("receipts.json", "r") as f:
            receipts = json.load(f)
    except FileNotFoundError:
        receipts = []

    receipts.append(receipt)

    with open("receipts.json", "w") as f:
        json.dump(receipts, f)

    return FileResponse(img_byte_arr, media_type="image/png", filename=f"receipt_{datetime.now().strftime('%Y%m%d%H%M%S')}.png")

@app.get("/receipts")
async def get_receipts(request: Request):
    try:
        with open("receipts.json", "r") as f:
            receipts = json.load(f)
    except FileNotFoundError:
        receipts = []
    return templates.TemplateResponse("receipts.html", {"request": request, "receipts": receipts})