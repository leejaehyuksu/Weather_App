import React, { useEffect, useState } from 'react';
import { FlatList, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service'; //위치정보를 사용하기 위한 라이브러리 추가

import Styled from 'styled-components/native';

const Container = Styled.SafeAreaView`
  flex: 1;
  background-color: #EEE;
`;

const WeatherContainer = Styled(FlatList)``; //단순히 View컴포넌트를 사용하지 않고 FlatList를 사용한 이유는 FlatList의 당겨서 갱신하기 기능을 사용하기 위해씀

const LoadingView = Styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;
const Loading = Styled.ActivityIndicator`
    margin-bottom: 16px;
`;
const LoadingLabel = Styled.Text`
  font-size: 30px;
`;

const WeatherItemContainer = Styled.View`
  height: 100%;
  justify-content: center;
  align-items: center;
`;
const Weather = Styled.Text`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
`;
const Temperature = Styled.Text`
  font-size: 16px;
`;

interface Props { }

const API_KEY = '73bd07d674cc4569f650bad6f22dc79d';

interface IWeather {
    temperature?: number;
    weather?: string;
    isLoading: boolean;
}
const WeatherView = ({ }: Props) => {
    const [weatherInfo, setWeatherInfo] = useState<IWeather>({
        temperature: undefined,
        weather: undefined,
        isLoading: false,
    });
    //WeatherView컴포넌트에서 사용할 정보를 타입스크립트를 사용하여 정의
    //또한 이타입을 useState에서 사용하여 컴포넌트에 갱신할 수 있는 데이터인 State를 생성
    const getCurrentWeather = () => {
        //이 getCurrentWeather함수는 앱이 처음 실행될 때, 당겨서 갱신하기 기능을 사용할 때, 두 곳에서 호출하도록 설정하여 날씨 정보를 가져올 예정이다.
        setWeatherInfo({
            isLoading: false,
        });
        Geolocation.getCurrentPosition(    //Geolocation.getCurrentPosition을 통해 현재 위치의 위도와 경도를 가져옴
            position => {
                const { latitude, longitude } = position.coords;   //위도와 경도
                fetch(
                    `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${API_KEY}&units=metric`
                )
                    .then(response => response.json())
                    .then(json => {
                        setWeatherInfo({
                            temperature: json.main.temp,
                            weather: json.weather[0].main,
                            isLoading: true,
                        });
                    })
                    .catch(error => {
                        setWeatherInfo({
                            isLoading: true,
                        });
                        showError('날씨 정보를 가져오는데 실패하였습니다.');
                    });
            },
            //OpenWeather의 API를 Fetch API를 사용하여 호출
            //Fetch API는 promise함수이므로 then과 catch를 사용해 정상처리와 에러처리 가능
            //정상 처리에서는 API를 통해 가져온 JSON 데이터에서 필요한 데이틀 setWeatherInfo를 통해 State에 설정
            error => {
                setWeatherInfo({
                    isLoading: true,
                });
                showError('위치 정보를 가져오는데 실패하였습니다.');//이렇게 가져온 위치정보를 showError을 통해 화면에 표시
            }
        );
    };
    //위치정보를 습득하여 해당 위치의 날씨 정보를 가져오기 위한 getCurrentWeather함수를 정의
    const showError = (message: string): void => {
        setTimeout(() => {
            Alert.alert(message);
        }, 500);
    };
    //실패메세지를 표시할 때 사용하는 함수이며 setTimeout을 사용한 이유는 setWeatherInfo를 사용하여 
    //State를 갱신하여 화면을 갱신했지면 Alert.alert에 의해 화면이 갱신되지않는 문제를 해결하기 위해 비동기로 처리
    useEffect(() => {
        getCurrentWeather();
    }, []);
    //useEffect를 사용하여 WeatherView 컴포넌트가 화면에 표시된 후 날씨 데이터를 가져오도록 설정,
    //또한 두 번째 매개변수로 빈 문자열을 사용함으로써 Props,State가 변경되어 화면이 업데이트 될때에는 호출되지 않도록 설정
    let data = [];
    const { isLoading, weather, temperature } = weatherInfo;
    if (weather && temperature) {
        data.push(weatherInfo);
    }

    return (
        <Container>
            <WeatherContainer
                onRefresh={() => getCurrentWeather()}
                refreshing={!isLoading}
                data={data}
                keyExtractor={(item, index) => {
                    return `Weather-${index}`;
                }}
                ListEmptyComponent={
                    <LoadingView>
                        <Loading size="large" color="#1976D2" />
                        <LoadingLabel>Loading...</LoadingLabel>
                    </LoadingView>
                }
                renderItem={({ item, index }) => (
                    <WeatherItemContainer>
                        <Weather>{(item as IWeather).weather}</Weather>
                        <Temperature>({(item as IWeather).temperature}°C)</Temperature>
                    </WeatherItemContainer>
                )}
                contentContainerStyle={{ flex: 1 }}
            />
        </Container>
        //FlatList의 사용법은 TodoList를 확인하자 6장과는 다르게 FlatList의 당겨서 갱신하기 기능을 사용
        //onRefresh에 당겨서 갱신할 때, 호출할 함수를 정의한다. refreshing에는 당겨서 갱신하기 기능을 사용하여
        //데이터를 갱신중인지 데이터 갱신이 끝났는지를 알려주기 위한 boolean값을 설정
        //이렇게 두 값을 설정하면 당겨서 갱신하기 기능을 사용할 수 있다.
    );
};

export default WeatherView;
