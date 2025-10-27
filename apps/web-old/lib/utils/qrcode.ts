import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCode = async (
  text: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    ...options,
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

export const generateQRCodeSVG = async (
  text: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    ...options,
  };

  try {
    const qrCodeSVG = await QRCode.toString(text, {
      type: "svg",
      ...defaultOptions,
    });
    return qrCodeSVG;
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code SVG");
  }
};
