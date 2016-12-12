/**
 * Created by apple on 16/12/12.
 */

var imgUrl = 'rabbit-big.png';

var positions = ['0 -854','-174 -852','-349 -852','-524 -852','-698 -852','-873 -848'];

var ele = document.getElementById('rabbit');

animation(ele, positions, imgUrl);

function animation(ele, positions, imgUrl){

    ele.style.backgroundImage = 'url(' + imgUrl + ')';
    ele.style.backgroundImage = 'no-repeat';

    var index = 0;

    function run() {

        var position = positions[index].split(' ');
        ele.style.backgroundPosition = position[0] + 'px' + position[1] + 'px';

        index++;

        if(index >= positions.length){
            index = 0;
        }
        setTimeout(run, 80);
    }

    run();
}