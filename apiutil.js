var request = require('bluebird').promisifyAll(require('request'));

//var url = 'https://508c-r12.apptio.com/biit/api/v2/domains/reference.apptio.com/projects/Cost Transparency/reports/33d03665-aafd-4931-bed9-832ac55c64f1/dates/Jun:FY2016/components/4157';
//var url = 'https://508c-r12.apptio.com/biit/api/v2/report?reportPath=-@Creference.apptio.com%3ACost+Transparency/Reports/.DateGoesHere/CostModels/Default/.View%3Atab%3AService+Costing/.View%3AIT+Finance+-+Summary&date=Feb:FY2017&componentId=4157&environment=prd';

var kpiDictionary = {
    'total cost' : 'Cost',
    'total spend' : 'Cost',
    'overall cost' : 'Cost',
    'variable cost': '% Variable',
    'variable spend': '% Variable',
    'capital cost': '% Capital Spend',
    'capital spend': '% Capital Spend',
    'cloud cost' : 'Total',
    'cloud spend' : 'Total'  
};

var urlDictionary =
    {
        'Cost':'https://508c-r12.apptio.com/biit/api/v2/report?reportPath=-@Creference.apptio.com%3ACost+Transparency/Reports/.DateGoesHere/CostModels/Default/.View%3Atab%3AService+Costing/.View%3AIT+Finance+-+Summary&date=Feb:FY2017&componentId=4157&environment=prd',
        '% Variable' : 'https://508c-r12.apptio.com/biit/api/v2/report?reportPath=-@Creference.apptio.com%3ACost+Transparency/Reports/.DateGoesHere/CostModels/Default/.View%3Atab%3AService+Costing/.View%3AIT+Finance+-+Summary&date=Feb:FY2017&componentId=4157&environment=prd',
        '% Capital Spend': 'https://508c-r12.apptio.com/biit/api/v2/report?reportPath=-@Creference.apptio.com%3ACost+Transparency/Reports/.DateGoesHere/CostModels/Default/.View%3Atab%3AService+Costing/.View%3AIT+Finance+-+Summary&date=Feb:FY2017&componentId=4157&environment=prd'
        'Total': 'https://508c-r12.apptio.com/biit/api/v2/report?reportPath=-@Creference.apptio.com%3ACost+Transparency/Reports/.DateGoesHere/CostModels/Default/.View%3Atab%3AService+Costing/.View%3APublic+Cloud+-+TCO&date=Feb:FY2017&componentId=4583&environment=prd'
    };

var username = 'dan@reference.apptio.com';
var password = 'Apptio508!';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

module.exports = {

    getKpis(session, kpiTitle)
    {
        var normalizedKpi = kpiDictionary[kpiTitle];
        
        //session.send('normalizedKpi is ' + normalizedKpi);
        
        if (normalizedKpi === null)
        {
            session.send("Oops! I could not find this KPI");
            return 'Error';
        }
        
        var url = urlDictionary[normalizedKpi];
        
        //session.send('url is ' + url);
        
        if (url === null)
        {
            session.send("Oops! I could not find this KPI");
            return 'Error';
        }
        
        request.getAsync({
                url: url,
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
                'Access-Control-Allow-Origin' : '*',
                //'Cookie' : auth
                'Authorization': auth
                },
                json: true,

            }).then((response) => {        

                if (response.statusCode  === 200) {

                   var kpi = response.body.kpis.filter(function(kp){
                                return (kp.primaryTitle  === normalizedKpi);
                    });
                    session.send("Your " + kpiTitle + " is " + kpi[0].primaryValue);
                    //session.send(kpi[0].primaryTitle + ':' + kpi[0].primaryValue);
                    console.log(kpi[0].primaryTitle + ':' + kpi[0].primaryValue);
                    
                } else {
                    session.send("Oops! KPI is not available at this time. I received this error: " + response.statusCode);
                    console.log('response code: ' + response.statusCode);
                }

            }).catch((err) => {           
                console.log(err);
            });
    }
};
