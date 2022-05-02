/*
    This Software is licensed under the GNU General Public License (GPL) v3.
 */

cTID = function(s) {return app.charIDToTypeID(s); };
sTID = function(s) {return app.stringIDToTypeID(s); };

function findAll (findIn, regexp) {
    var match, matches = [];
    while( (match = regexp.exec(findIn)) != null) {matches.push(match.index);}
    return matches;
}

String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};


var textObj = jamText.getLayerText().layerText;
var lineBreakPos = findAll(textObj.textKey, /[\r\n]/g);
var lines = textObj.textKey.split('\r');
var textStyleRanges = textObj.textStyleRange;
var textStylePerChar = [];

for (var i=0; i < textObj.textKey.length; i++){

  var textStyle;
  for (var j=0; j < textStyleRanges.length; j++) {
    var range = textStyleRanges[j];
    if(i>=range.start && i < range.to) {
      textStyle = range.textStyle;
    } else {
      textStyle = {};
    }
  }

  textStylePerChar.push({
    from: i,
    to: i+1,
    textStyle: textStyle
  })
}


for (var i=0; i < textStyleRanges.length; i++){
    var textStyleRange = textStyleRanges[i];
    var textStyle = textStyleRange.textStyle;
    
    if( textStyle.syntheticBold ) {
        var len = textStyleRange.to - textStyleRange.from;
        
        var lastLineBreakPos, boldLineNumber;
        if( lines.length === 1 ) {
            lastLineBreakPos = 1;
            boldLineNumber = 0;
        } else if ( lines.length === 2) {
            lastLineBreakPos = lineBreakPos[1] + 1;
            boldLineNumber = 1;
        }
        else {
            lastLineBreakPos = lineBreakPos.reduce(function (prev, curr) {
                return (Math.abs(curr - textStyleRange.from) < Math.abs(prev - textStyleRange.from) ? curr : prev);
            }) + 1;
            boldLineNumber = lines.indexOf(lastLineBreakPos);
        }
        var distFromLastLineBreak = textStyleRange.from - lastLineBreakPos;

        var extraLine;
        if( boldLineNumber > 0 && lines[boldLineNumber - 1].isExtra ) {
            extraLine = lines[boldLineNumber - 1];
            for( var j=extraLine.length; j < textStyleRange.to; j++ ) {
                if(j < distFromLastLineBreak) {
                    extraLine += '　';
                } else {
                    extraLine += '·';
                }
            }
        } else {
            extraLine = '　'.repeat(distFromLastLineBreak) + '·'.repeat(len);
            extraLine.isExtra = true;
        }
        lines.splice(boldLineNumber, 0,  extraLine);
    }
}

textObj.textKey = lines.join('\r');
jamText.setLayerText({
    layerText: textObj
});

var res = jamText.getLayerText().layerText;