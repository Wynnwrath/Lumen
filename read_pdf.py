import sys

def read_pdf(pdf_path):
    # Try pypdf / PyPDF2 / fitz / pdfplumber
    try:
        import fitz # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        pass

    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        pass

    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        pass

    return "No PDF parser found."

if __name__ == "__main__":
    print(read_pdf("f:/Lumen/CubeTech Web Development Intern Assessment.pdf"))
