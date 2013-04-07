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

var getButton = function(button) {
    if (button === 0) {
        return "Conway's Original";
    } else if (button === 1) {
        return "Coral";
    } else if (button == 2) {
        return "Amoeba";
    } else {
        return "Slow Burn";
    }
}
