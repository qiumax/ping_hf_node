// function sleep(milliSeconds) {
//     var startTime = new Date().getTime();
//     while (new Date().getTime() < startTime + milliSeconds);
//  };
// var date1 = new Date();
// sleep(10000);
// var date2 = new Date();
//
// console.log(date1);
// console.log(date2);
//
// console.log(date1 - date2);

getBonus = function (rules, finish_num) {
    for(var i=rules.length-1; i>=0; i--) {
        if(finish_num >= rules[i].num) {
            return rules[i].bonus;
        }
    }
    return 0;
}

var rules = [
    {
        "num" : 3,
        "bonus" : 1000
    },
    {
        "num" : 20,
        "bonus" : 2000
    },
    {
        "num" : 50,
        "bonus" : 3000
    },
    {
        "num" : 100,
        "bonus" : 5000
    }
]

console.log(getBonus(rules,3));