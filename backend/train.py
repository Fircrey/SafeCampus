"""
Script de entrenamiento YOLOv8 - Detector de Armas
Dataset: weapons.v1i.yolov8 (Roboflow)
Clases: billete, knife, monedero, pistol, smartphone, tarjeta
"""

import os
import shutil
from multiprocessing import freeze_support

from ultralytics import YOLO


def main():
    # Rutas
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_YAML = os.path.join(BASE_DIR, "dataset", "weapons", "data.yaml")
    OUTPUT_DIR = os.path.join(BASE_DIR, "models")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 50)
    print("  ENTRENAMIENTO YOLOv8 - Detector de Armas")
    print("=" * 50)
    print(f"  Dataset: {DATA_YAML}")
    print(f"  Output:  {OUTPUT_DIR}")
    print()

    # Cargar modelo base YOLOv8 small (buen balance precision/velocidad)
    model = YOLO("yolov8s.pt")

    # Entrenar con GPU (RTX 5070 12GB)
    results = model.train(
        data=DATA_YAML,
        epochs=50,
        imgsz=640,
        batch=16,
        device=0,
        patience=10,
        save=True,
        save_period=10,
        project=OUTPUT_DIR,
        name="weapons_train",
        exist_ok=True,
        pretrained=True,
        optimizer="auto",
        verbose=True,
        workers=0,          # Evita problemas de multiprocessing en Windows
        plots=True,
    )

    print()
    print("=" * 50)
    print("  ENTRENAMIENTO COMPLETADO")
    print("=" * 50)

    # Copiar el mejor modelo a models/best.pt
    best_model_path = os.path.join(OUTPUT_DIR, "weapons_train", "weights", "best.pt")
    final_path = os.path.join(OUTPUT_DIR, "best.pt")

    if os.path.exists(best_model_path):
        shutil.copy2(best_model_path, final_path)
        print(f"  Mejor modelo copiado a: {final_path}")
    else:
        print(f"  [WARN] No se encontro best.pt en {best_model_path}")

    print()
    print("  Para ver metricas: backend/models/weapons_train/")
    print("  Archivos: results.png, confusion_matrix.png, etc.")
    print("=" * 50)


if __name__ == "__main__":
    freeze_support()
    main()
