export function getElementByType(type, selector){
    switch(type.toLowerCase()){
        case 'id': {
            return document.getElementById(selector);
        }

        case 'class': {
            return document.getElementsByClassName(selector);
        }

        case 'tag': {
            return document.getElementsByTagName(selector);
        }

        default: {
            return null;
        }
    }

}