var request = require('bluebird').promisifyAll(require('request'));

var url = 'https://products-r12.apptio.com/biit/api/v2/domains/reference.apptio.com/projects/Cost Transparency/reports/33d03665-aafd-4931-bed9-832ac55c64f1/dates/Jun:FY2016/components/4157';
var auth = 'auth=QMCxClS9K1a67fknDaz8dQ';

module.exports = {

    getKpis(session, kpiType, kpiTitle)
    {
        request.getAsync({
                url: url,
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
                'Access-Control-Allow-Origin' : '*',
                'Cookie' : auth
                },
                json: true,

            }).then((response) => {        

                if (response.statusCode  === 200) {

                   var kpi = response.body.kpis.filter(function(kp){
                                return (kp.primaryTitle  === kpiType);
                    });
                    session.send("Your " + kpiTitle + " is " + kpi[0].primaryValue);
                    //session.send(kpi[0].primaryTitle + ':' + kpi[0].primaryValue);
                    console.log(kpi[0].primaryTitle + ':' + kpi[0].primaryValue);
                    
                } else {
                    session.send("Opps! KPI is not available at this time. I received this error: " + response.statusCode);
                    console.log('response code: ' + response.statusCode);
                }

            }).catch((err) => {           
                console.log(err);
            });
    }
};
