var NUM_EXAMPLES = 3;

$(document).ready(function() {
    appendButtons();
});

var appendButtons = function() {
    for (var example = 0; example < NUM_EXAMPLES; example++) {
        $('.example-rules').append('<button class="example-button" id="btn' + example + '">' + getButton(example) + '</button>');
    }
    $(".example-rules button").click(function() {
        console.log($(this).index());

        GoL3D.setRules(getButton($(this).index()));
    });
};

var buttons = {"Conway's Original", "Coral", "Amoeba", "Slow Burn", "Slow Burn 2", "Diamonds"};

var getButton = function(button) {
    return buttons[button];
}
