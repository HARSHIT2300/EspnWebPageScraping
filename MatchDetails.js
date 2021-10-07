// const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/chennai-super-kings-vs-delhi-capitals-7th-match-1216539/full-scorecard";
const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const { data } = require("cheerio/lib/api/attributes");
function getScoreBoardURL(url)
{
    request(url,cb);
}

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
    let matchdetails=$(".header-info .description");
    matchdetails=matchdetails.text().split(',');     // changing the matchdetails element to a string array, quite a beautiful feature of VS CODE...............
    let venue  = matchdetails[1].trim();
    let date = matchdetails[2].trim();
    let result = $(".event .status-text").text();
    // console.log(result);
    // console.log(venue, " ", date);
    let innings = $(".card.content-block.match-scorecard-table .Collapsible");
    let pageHTML="";
    for(let i=0;i<innings.length;i++)
    {
        // pageHTML+=$(innings[i]).html();
        let teamname=$(innings[i]).find(".header-title.label").text().split("INNINGS")[0];
        console.log(teamname);
        let oppindex = i==0 ? 1 : 0;
        let oppname = $(innings[oppindex]).find(".header-title.label").text().split("INNINGS")[0];
        console.log(`Venue : ${venue} Date : ${date} TeamName : ${teamname}  OpponentName : ${oppname} Result : ${result}`);
        let playerrows = $(innings[i]).find(".table.batsman tbody tr");
        
        for(let j=0;j<playerrows.length;j++)
        {
            let playerstats = $(playerrows[j]).find("td");
            if(playerstats.length<5) continue;
            // console.log(playerrows.length);
            let pname = $(playerstats[0]).text().trim();
            let pruns = $(playerstats[2]).text().trim();
            let pbowls = $(playerstats[3]).text().trim();
            let p4s =  $(playerstats[5]).text().trim();
            let p6s =  $(playerstats[6]).text().trim();
            let pSR =  $(playerstats[7]).text().trim();

            // console.log(`PlayerName : ${pname} PlayerRuns : ${pruns} BowlsFaced : ${pbowls}  FoursHit : ${p4s} SixesHit : ${p6s} StrikeRate : ${pSR}`);
            create_pl_fl(teamname,pname,pruns,pbowls,p4s,p6s,pSR,oppname,venue,date,result);
        }
    }
    // console.log(pageHTML);
}
function excelReader(filepath,sheetname)
{
    if(fs.existsSync(filepath)==false)
    return [];

    let wkbk=xlsx.readFile(filepath);
    let exceldata = wkbk.Sheets[sheetname];
    let jsondata = xlsx.utils.sheet_to_json(exceldata);
    return jsondata;
}
function excelWriter(filepath,jsondata,sheetname)
{
    let newWb = xlsx.utils.book_new();
    let newWs = xlsx.utils.json_to_sheet(jsondata);
    xlsx.utils.book_append_sheet(newWb,newWs,sheetname);
    xlsx.writeFile(newWb,filepath);
}
function create_pl_fl(teamname,pname,pruns,pbowls,p4s,p6s,pSR,oppname,venue,date,result)
{
    let team_path=path.join(__dirname,"ipl",teamname);
    create_dir(team_path);
    let player_path=path.join(team_path,pname+".xlsx");
    let json_player_data = excelReader(player_path,pname);
    let player_obj = {
        teamname,pname,pruns,pbowls,p4s,p6s,pSR,oppname,venue,date,result
    }
    json_player_data.push(player_obj);
    excelWriter(player_path,json_player_data,pname);
}
function create_dir(filepath)
{
    if(fs.existsSync(filepath)==false)
    fs.mkdirSync(filepath); 
}
module.exports = {
    scores : getScoreBoardURL
}