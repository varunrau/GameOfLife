var NUM_EXAMPLES = 3;

$(document).ready(function() {
    appendButtons();
});

var appendButtons = function() {
    for (var example = 0; example < NUM_EXAMPLES; example++) {
        $('.example-rules').append('<button class="example-button">' + getButton(example) + '</button>');
    }
    $(".example-button").click(function() {
        console.log($(this).attr('text'));
        console.log(this.title);
        GoL3D.setRules(this.title);
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
