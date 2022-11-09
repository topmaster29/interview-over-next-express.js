var produceWordCountMap=require('../scripts/wordCount');

describe('word count test', ()=>{
    test('to equal', ()=>{
        var result=produceWordCountMap('and and');
        expect(result).toEqual({"and":2})
    })
})