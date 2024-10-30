import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response
  let authToken
  let jwtToken

  group('Login and order - https://pizza.alamigo.org/', function () {
    response = http.get('https://pizza.alamigo.org/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,en-US;q=0.9',
        'cache-control': 'max-age=0',
        'if-modified-since': 'Thu, 26 Sep 2024 22:18:59 GMT',
        'if-none-match': '"9cc8e382e0c6b3595ab930cd666a7811"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(9.1)

    response = http.put(
      'https://pizza-service.alamigo.org/api/auth',
      '{"email":"a@jwt.com","password":"admin"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en,en-US;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.alamigo.org',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
      console.log(response.body);
      fail('Login was *not* 200');
    }
    if (typeof response.body === 'string') {
      try {
        const responseBody = JSON.parse(response.body);
        authToken = responseBody.token;
      } catch (error) {
        console.log('Failed to parse auth token from response:', error);
        fail('Auth token not found in response');
      }
    } else {
      fail('Response body is not a string');
    }
    sleep(2.4)

    response = http.get('https://pizza-service.alamigo.org/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,en-US;q=0.9',
        'content-type': 'application/json',
        'if-none-match': 'W/"1fc-cgG/aqJmHhElGCplQPSmgl2Gwk0"',
        origin: 'https://pizza.alamigo.org',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.get('https://pizza-service.alamigo.org/api/franchise', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,en-US;q=0.9',
        'content-type': 'application/json',
        'if-none-match': 'W/"96-DowopGr5qEJo6ijbYHbaKvbawFs"',
        origin: 'https://pizza.alamigo.org',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(8.9)

    response = http.post(
      'https://pizza-service.alamigo.org/api/order',
      '{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042},{"menuId":4,"description":"Crusty","price":0.0028}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en,en-US;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.alamigo.org',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          authorization: "Bearer " + authToken,
        },
      }
    )
    if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
      console.log(response.body);
      fail('Order was *not* 200');
    }
    sleep(2.4)

    if (typeof response.body === 'string') {
      try {
        const responseBody = JSON.parse(response.body);
        jwtToken = responseBody.jwt;
      } catch (error) {
        console.log('Failed to parse JWT from response:', error);
        fail('JWT not found in response');
      }
    } else {
      fail('Response body is not a string');
    }

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      JSON.stringify({ jwt: jwtToken }),
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en,en-US;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.alamigo.org',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
      }
    )
  })
}