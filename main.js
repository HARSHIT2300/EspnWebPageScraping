const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const path = require("path");
const ScoreBoardLink = require("./MatchDetails");
request(url,cb);
const ipl_path = path.join(__dirname,"ipl");
create_dir(ipl_path);
function cb(error,response,html)
{
    if(error)
    {
        console.log(error);
    }
    else
    {
        extractHTML(html);
    }
}
function extractHTML(html)
{
    let $=cheerio.load(html);
    let anchorelement = $("a[data-hover='View All Results']");
    let link = anchorelement.attr("href");
    link="https://www.espncricinfo.com"+link;
    getAllMatches(link);
}
function getAllMatches(url)
{
    request(url, function(error,response,html){
            if(error)
            {
                console.log(error);
            }
            else{
                getScores(html);
            }
    });
}
function getScores(html)
{
    let $ = cheerio.load(html);
    let scores = $("a[data-hover='Scorecard']");
    for(let i=0;i<scores.length;i++)
    {
        let link=$(scores[i]).attr("href");
        
        link="https://www.espncricinfo.com"+link;
        ScoreBoardLink.scores(link);
        // console.log(link);
    }

}
function create_dir(filepath)
{
    if(fs.existsSync(filepath)==false)
    fs.mkdirSync(filepath); 
}