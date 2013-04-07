var buttons = [ "Conway's Original", "Coral", "Amoeba", "Slow Burn", "Slow Burn 2", "Diamonds" ];

$(document).ready(function() {
    appendButtons();
});

var appendButtons = function() {
    console.log(buttons.length);
    for (var example = 0; example < buttons.length; example++) {
        $('.example-rules').append('<button class="example-button" id="btn' + example + '">' + getButton(example) + '</button>');
    }
    $(".example-rules button").click(function() {
        console.log($(this).index());

        GoL3D.setRules(getButton($(this).index()));
    });
};


var getButton = function(button) {
    return buttons[button];
}
