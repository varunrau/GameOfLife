var buttonNames = [ "Conway's Original", "Coral", "Amoeba", "Slow Burn", "Slow Burn 2", "Diamonds" ];

$(document).ready(function() {
    appendButtons();
});

var appendButtons = function() {
    console.log(buttons.length);
    for (var example = 0; example < buttons.length; example++) {
        $('.example-rules').append('<button class="example-button" id="btn' + example + '">' + buttonNames[example] + '</button>');
    }
    $(".example-rules button").click(function() {
        console.log($(this).index());

        GoL3D.setRules(buttonNames[($(this).index())]);
    });
};
