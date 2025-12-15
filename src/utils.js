export function getElementByType(type, selector){
    switch(type.toLowerCase(type)){
        case 'id': {
            return document.getElementById(selector);
        }

        case 'class': {
            return document.getElementsByClassName(selector);
        }

        case type.toLowerCase() === 'tag': {
            return document.getElementsByTagName(selector);
        }

        default: {
            console.log('Invalid selector type!');
            break;
        }
    }

}