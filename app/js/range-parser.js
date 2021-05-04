/*
 range-parser
 Copyright(c) 2012-2014 TJ Holowaychuk
 Copyright(c) 2015-2016 Douglas Christopher Wilson
 MIT Licensed
*/
function rangeParser(b,a,g){if("string"!==typeof a)throw new TypeError("argument str must be a string");var c=a.indexOf("=");if(-1===c)return-2;var f=a.slice(c+1).split(","),e=[];e.type=a.slice(0,c);for(a=0;a<f.length;a++){var d=f[a].split("-");c=parseInt(d[0],10);d=parseInt(d[1],10);isNaN(c)?(c=b-d,d=b-1):isNaN(d)&&(d=b-1);d>b-1&&(d=b-1);isNaN(c)||isNaN(d)||c>d||0>c||e.push({start:c,end:d})}return 1>e.length?-1:g&&g.combine?combineRanges(e):e}
function combineRanges(b){for(var a=b.map(mapWithIndex).sort(sortByRangeStart),g=0,c=1;c<a.length;c++){var f=a[c],e=a[g];f.start>e.end+1?a[++g]=f:f.end>e.end&&(e.end=f.end,e.index=Math.min(e.index,f.index))}a.length=g+1;a=a.sort(sortByRangeIndex).map(mapWithoutIndex);a.type=b.type;return a}function mapWithIndex(b,a){return{start:b.start,end:b.end,index:a}}function mapWithoutIndex(b){return{start:b.start,end:b.end}}function sortByRangeIndex(b,a){return b.index-a.index}
function sortByRangeStart(b,a){return b.start-a.start};