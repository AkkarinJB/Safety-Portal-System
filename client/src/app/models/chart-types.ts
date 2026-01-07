export interface ChartConfiguration {
  type: string;
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: ChartPlugins;
}

export interface ChartPlugins {
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
}

export interface ChartLegend {
  display?: boolean;
  position?: string;
  labels?: ChartLegendLabels;
}

export interface ChartLegendLabels {
  padding?: number;
  font?: {
    size?: number;
  };
  generateLabels?: (chart: ChartInstance) => ChartLegendItem[];
}

export interface ChartLegendItem {
  text: string;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  hidden: boolean;
  index: number;
}

export interface ChartTooltip {
  callbacks?: {
    label?: (context: ChartTooltipContext) => string;
  };
}

export interface ChartTooltipContext {
  label?: string;
  parsed?: number;
  dataset?: ChartDataset;
  dataIndex: number;
}

export interface ChartInstance {
  data: ChartData;
  destroy(): void;
  toBase64Image(type?: string, quality?: number): string;
}

export interface ChartConstructor {
  new (ctx: CanvasRenderingContext2D, config: ChartConfiguration): ChartInstance;
}

export interface WindowWithChart extends Window {
  Chart?: ChartConstructor;
}

