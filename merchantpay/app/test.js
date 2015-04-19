function padString(template, input) {
    var inLen = input.length,
        tmpLen = template.length,
        diffLen = tmpLen - inLen;
    
    console.log('inLen, tmpLen, diffLen', inLen, tmpLen, diffLen);

    if (inLen > tmpLen) {
        return input.substr(0, tmpLen);
    } else {
        return template.substr(0, diffLen) + input;
    }
}


console.log(padString('000000', ''));
