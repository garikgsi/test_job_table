import jsonData from "@/data.json";

const isApiError=()=>{
    // slow network - only 50% requests are OK
    return Math.random()<0.5
}

export const apiCall=(method,data=null)=>{
    return new Promise((resolve, reject)=>{
        if (isApiError()) {
            setTimeout(()=>{
                reject({
                    code: 400,
                    error: `Some API Error when ${method} method called`
                })                
                }
            ,1000)

        } else {
            const delay = Math.random*1000
            switch(method.toLowerCase()) {
                case 'get': {
                    setTimeout(()=>{
                        resolve({
                            code: 200,
                            data: jsonData
                        })                        
                    }
                    ,delay)
                } break;
                case 'delete': {
                    setTimeout(()=>{
                        resolve({
                            code:202,
                            data:data.length
                        })
                    }
                    ,delay)
                } break;
            }
        }
    })
}
