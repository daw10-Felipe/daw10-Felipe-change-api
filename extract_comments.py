import json

notebook_path = r"c:\Users\Alumno\Downloads\4_4_Pruebas_A_B_con_IA_en_Metadescripción.ipynb"
out_path = "extracted.txt"

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)
    
with open(out_path, 'w', encoding='utf-8') as out:
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'markdown':
            out.write(f"--- Markdown Cell {i} ---\n")
            for line in cell.get('source', []):
                out.write(line.strip() + "\n")
        elif cell['cell_type'] == 'code':
            out.write(f"--- Code Cell {i} ---\n")
            for line in cell.get('source', []):
                if line.strip().startswith('#'):
                    out.write(line.strip() + "\n")
