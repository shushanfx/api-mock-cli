const request = require('request');

module.exports = async (...args) => {
  return new Promise((resolve) => {
    let arr = [...args, (err, res, body) => {
      if (err) {
        resolve({
          code: -1001,
          message: err.message
        });
        return;
      }
      try {
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
        if (body) {
          resolve(body);
        } else {
          resolve({
            code: -1,
            message: '操作失败！'
          });
        }
      } catch (e) {
        resolve({
          code: -1,
          message: "json转换失败"
        })
      }
    }];
    let req = request.apply(request, arr);
    return req;
  });
}