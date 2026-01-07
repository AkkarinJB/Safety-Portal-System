export interface JSPDF {
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
  setFontSize(size: number): void;
  text(text: string, x: number, y: number, options?: { align?: string }): void;
  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void;
  save(filename: string): void;
}

export interface JSPDFConstructor {
  new (orientation: string, unit: string, format: string): JSPDF;
}

export interface WindowWithJSPDF extends Window {
  jsPDF?: JSPDFConstructor;
}

