import * as _ from 'lodash';

export const makeSvg = (
  tracks: number[][][],
  height: number,
  width: number,
): string => {
  if (!_.isArray(tracks)) {
    return '';
  }
  const polylines = tracks.map(track => {
    if (!track) return ''
    const points = track.join(' ');
    return `
    <polyline points="${points}"
    style="fill:none;stroke:red;stroke-width:2" />`
  }).join('')
  return `<svg height="${height}" width="${width}">${polylines}</svg>`;
};
