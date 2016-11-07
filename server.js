var express = require("express");
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var jsonFile = require("jsonfile");

server.use(express.static("js"));
server.use(express.static("css"));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:true}));



server.get("/",function(req,res){
   
   res.render("index.jade");
});

server.get("/getList/searchContent/:s/whatToSearch/:o",function(req,res){
    console.log(req.params.s);
    var configFile = "";
    
    if(req.params.o == "book")
    {
        console.log("Reading File 'bookData.json'");
        configFile = fs.readFileSync("./bookData.json");
    }
    else
    {
        console.log("Reading File 'authorData.json'");
        configFile = fs.readFileSync("./authorData.json");
    }
   var jsObj = JSON.parse(configFile);
   var searchedList = [];
   var searchContent = req.params.s;
   if(req.params.o == "book")
   {
        for (x in jsObj)
        {
            if(jsObj[x].title == searchContent || jsObj[x].author == searchContent)
            {
                searchedList.push(jsObj[x]);
                console.log("Book found and pushed into the response data");
            }
        }
   }
   else
   {
       for (x in jsObj)
        {
            console.log("Looping Author array..."+req.params.s);
            if(jsObj[x].authorName == req.params.s)
            {
                searchedList.push(jsObj[x]);
                console.log("Author details found and pushed into the response data");
            }
        }
   }
   res.send(searchedList);
});


server.get("/addBook",function(req,res){
   res.render("addBook.jade");
});
server.get("/addAuthor",function(req,res){
   res.render("addAuthor.jade");
});

server.get("/edit/id/:id/content/:content",function(req,res){
    console.log(req.params.id);
    var configFile = fs.readFileSync("./bookData.json");
    var prop = "bookId";
    var navigateTo = "editBook.jade";
    if(req.params.content == "Author")
    {
        configFile = fs.readFileSync("./authorData.json");
        prop = "authorId";
        navigateTo = "editAuthor.jade";
    }
    var jsObj = JSON.parse(configFile);
    var len = jsObj.length;
    var contentDetails = {};
    for(i in jsObj)
    {
        if(jsObj[i][prop] == req.params.id)
        {
            console.log("Found Book");
            contentDetails = jsObj[i];
        }
    }
    
   res.render(navigateTo,{ content : contentDetails } );
});

server.post("/save",function(req,res){
    var filename = "./bookData.json";
    
    var id = req.body.bookId;
    var content = req.body.content;
    if(content === "author")
    {
        filename = "./authorData.json";
        id = req.body.authorId;
    }
    var configFile = fs.readFileSync(filename);
    var jsObj = JSON.parse(configFile);
    var len = jsObj.length;
    var lastContent = jsObj[len-1];  //Fetch last "book Object" from the "bookData.json" file which has array of "bookObjects"
    
    if(id != "")
    {   
        console.log("Editing the existing content having id : "+id);
        for(var i=0;i<len;i++)
        {
            if(jsObj[i].bookId == id || jsObj[i].authorId == id)
            {
                console.log("The contnet to be edited is found");
                if(content === "author")
                {
                    if(jsObj[i].authorName != req.body.authorName)
                    {
                        console.log("Author name has changed");
                        var configFile = fs.readFileSync("./bookData.json");
                        var bookObj = JSON.parse(configFile);
                        var len = bookObj.length;
                        for(var j=0;j<len;j++)
                        {
                            if(bookObj[j].authorId == jsObj[i].authorId)
                            {
                                console.log("The Book which Author name has changed, found");
                                bookObj[j].author = req.body.authorName;
                            }
                        }
                        var newConfigFile = JSON.stringify(bookObj);
                        fs.writeFileSync("./bookData.json",newConfigFile);
                        console.log("The BOoks with changed Author Name are stored.");
                    }
                    jsObj[i].authorId = parseInt(jsObj[i].authorId);
                }
                else
                {
                    jsObj[i].bookId = parseInt(jsObj[i].authorId)
                }
                jsObj[i] = req.body;
                
                break;
                
            }
        }
        
    }
    else
    {
        console.log("Storing new contents");
        var newId = 1;
                   // If "bookData.json" file is not empty.
        if(content === "author")
        {
            
            if(lastContent != null)
            {
                newId = lastContent.authorId + 1;
            }
            
            req.body.authorId = parseInt(newId);
            
        }
        else
        {
            if(lastContent != null)
            {
                newId = lastContent.bookId + 1;
            }
            
            req.body.bookId = parseInt(newId);
        }
        
    
        jsObj.push(req.body);
    }
    
    
    var newConfigFile = JSON.stringify(jsObj);
    fs.writeFileSync(filename,newConfigFile);
    console.log("The Content are stored.( written into "+filename+"file.)");
    res.redirect("/");
   
});


server.get("/delete/id/:id/whatToDelete/:whatToDelete",function(req,resp){
    var configFile = fs.readFileSync("./bookData.json");
    if(req.params.whatToDelete == "author")
    {
        configFile = fs.readFileSync("./authorData.json");
    }
    var jsObj = JSON.parse(configFile);
    var len = jsObj.length;
    var i;
    for(i in jsObj)
    {
        if(jsObj[i].authorId==req.params.id)
        {
           console.log("The element to be deleted is found at index "+i);
        }
    }
    
    
    
});

server.listen(8888,function(){
   console.log("server is listening on port 8888");
});


