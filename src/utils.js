export function getElementByType(type, selector){
    switch(type){
        case type.toLowerCase() === 'id': {
            document.getElementById(selector);
            break;
        }

        case type.toLowerCase() === 'class': {
            document.getElementsByClassName(selector);
            break;
        }

        case type.toLowerCase() === 'tag': {
            document.getElementsByTagName(selector);
            break;
        }

        default:{
            console.log('Invalid selector type!');
            break;
        }
    }

}