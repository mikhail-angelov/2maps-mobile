export const makeSvg = (coordinates: number[][], height: number, width: number ): string => {
    const points = coordinates.join(' ')
    return `
    <svg height="${height}" width="${width}">
    <polyline points="${points}"
    style="fill:none;stroke:red;stroke-width:2" />
    </svg>`
}