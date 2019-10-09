import React, { useMemo, useState, useEffect } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '~/services/api';

import Background from '~/components/Background';

import {
  Container,
  DateButton,
  DateText,
  HourList,
  Hour,
  Title,
} from './styles';

export default function SelectDateTime({ navigation }) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState([]);

  const provider = navigation.getParam('provider');

  useEffect(() => {
    async function loadAvailable() {
      const response = await api.get(`providers/${provider.id}/available`, {
        params: { date: date.getTime() },
      });

      setHours(response.data);
    }

    loadAvailable();
  }, [date, provider.id]);

  const dateFormatted = useMemo(
    () => format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    [date],
  );

  function handleChangeDate(event, newDate) {
    setShow(Platform.OS === 'ios' ? true : false);
    setDate(newDate || date);
  }

  function handleSelectHour(time) {
    navigation.navigate('Confirm', {
      provider,
      time,
    });
  }

  return (
    <Background>
      <Container>
        <DateButton onPress={() => setShow(true)}>
          <Icon name="event" size={20} color="#fff" />
          <DateText>{dateFormatted}</DateText>
        </DateButton>
        {show && (
          <DatePicker
            display="spinner"
            value={date}
            onChange={handleChangeDate}
          />
        )}
        <HourList
          data={hours}
          keyExtractor={item => item.time}
          renderItem={({ item }) => (
            <Hour
              onPress={() => handleSelectHour(item.value)}
              enabled={item.available}>
              <Title>{item.time}</Title>
            </Hour>
          )}
        />
      </Container>
    </Background>
  );
}

SelectDateTime.navigationOptions = ({ navigation }) => ({
  title: 'Selecione o horário',
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
      }}>
      <Icon name="chevron-left" size={20} color="#fff" />
    </TouchableOpacity>
  ),
});
