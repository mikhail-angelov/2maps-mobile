import { colorPalette } from "../constants/color"

export const renderColor = (rate?: number) => {
    return rate ? colorPalette[rate] : colorPalette[0];
}