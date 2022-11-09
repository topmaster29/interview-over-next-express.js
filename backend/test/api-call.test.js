var APIS=require('../scripts/api-call');

describe("api test", ()=>{
    test("get posts test", async ()=>{
        var result=await APIS.getPosts('https://testproject-wordpress-10312022.lcbits.com/wp-json/wp/v2/posts');
        expect.arrayContaining(result);
    });

    test("check host connection invalid url", async ()=>{
        var status=await APIS.testHostConnection('ddd');
        expect(status).toBe('invalid_url');
    });

    test("check host connection fake url", async ()=>{
        var status=await APIS.testHostConnection('https://testproject-sdf-sdfsdfsd.lcbits.com');
        expect(status).toBe(404);
    });

})