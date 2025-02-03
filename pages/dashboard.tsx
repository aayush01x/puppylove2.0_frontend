import Clear from '@/components/clear';
import ProfileSection from '@/app/(landing)/components/dashboard/profileSection';
import { Stack, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import styles from '@/styles/dashboard.module.css';
import NewSection from '@/app/(landing)/components/dashboard/newSection';
import MainSection from '@/app/(landing)/components/dashboard/mainSection';
import {Id, receiverIds, receiverSongs,setUser, Submit, user, Matched_Ids,} from '@/utils/UserData';
import { Student, search_students } from '@/utils/API_Calls/search';
import { useEffect, useState } from 'react';
import { fetchUserData } from '@/utils/API_Calls/login_api';
import { useRouter } from 'next/router';
import { SendHeart } from '@/utils/API_Calls/Send_Heart';
import { get_result } from '@/utils/API_Calls/get_results';

const dashboard  = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newDatafetched, setNewDataFetched] = useState(false);
  const [clickedStudents, setClickedStudents] = useState<Student[]>([]);
  const [hearts_submitted, set_hearts_submitted] = useState(Submit);
  const [resultPage, setResultPage] = useState(false);
  const [Matches, setMatches] = useState<Student[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<{ [key: string]: string | null }>({});
  const router = useRouter();
  const toast = useToast();

  // Fetch user data
  useEffect(() => {
    toast.closeAll();
    const fetchData = async () => {
      try {
        // console.log('Fetching user data..., before data: ' + receiverIds);
        setIsLoading(true);
        const result = await fetchUserData();
        if (result.success) {
          // Heart Sending Period Over, Now user is doing last day login to give Confirmation for Matching or to see Results(later)
          if (!result.permit) {
            if (!result.publish) {
              router.push(`/confirmation`);
            } else {
              setResultPage(true);
            }
          }
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        router.push('/login');
        toast({
          title: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsLoading(false);
        setNewDataFetched(true);
      }
    };
    fetchData(); // Call the async function // select the students after the data is fetched
  }, []);

  // update the user Id once the data is fetched.
  useEffect(() => {
    const wait = async () => {
      if (Id != '') {
        setUser(search_students(Id)[0]);
      }
    };
    wait();
  }, [Id]);


  // once the data is fetched, select the students and songs from the receiverIds and receiverSongs
  useEffect(() => {
    const fetchAndSelectStudents = () => {
      const selected: Student[] = [];
      const updatedSongIds: { [key: string]: string | null } = {};
      for (let i = 0; i < 4; i++) {
        const id = receiverIds[i];
         const songId = receiverSongs[i] || ''; 
        updatedSongIds[id] = songId;
        if (id === '') {
          continue;
        }
        const data = search_students(id);
        if (data == undefined) {
          return;
        }
        const student = data[0];
        if (student) {
          selected.push(student);
        }
      }
      setClickedStudents([...clickedStudents, ...selected]);
      setSelectedSongIds((prevSongIds) => ({...prevSongIds,...updatedSongIds,}));
    };
    fetchAndSelectStudents();
  }, [newDatafetched]);

  // sent heart api function
  const SendHeart_api = async (Submit: boolean) => {
    if (hearts_submitted) {
      return;
    }
    if (Submit) {
      set_hearts_submitted(true);
    }
    const selectedSongsData: { [key: string]: string | null } = {};
    for (let j = 0; j < clickedStudents.length; j++) {
      const id: string = clickedStudents[j].i;
      receiverIds[j] = id;
      selectedSongsData[id] = selectedSongIds[id] || null;
    }
    for (let j = clickedStudents.length; j < 4; j++) {
      receiverIds[j] = '';
      selectedSongsData[receiverIds[j]] = null;
    }
    const isValid = await SendHeart(Id, receiverIds,selectedSongsData, Submit);
    if (isValid && Submit) {
      toast({
        title: 'HEARTS SENT',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else if (!isValid && Submit) {
      toast({
        title: 'Error occurred , Hearts not sent',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else if (!isValid && !Submit && newDatafetched) {
      toast({
        title: 'Choices not saved',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const submit = async () => {
    await SendHeart_api(true);
    toast.closeAll();
  };

  // fetch match resluts
  useEffect(() => {
    const show_result = async () => {
      setIsLoading(true);
      await get_result();
      if (Matched_Ids[0] == '') {
        return;
      }
      for (let j = 0; j < Matched_Ids.length; j++) {
        const data: Array<Student> = search_students(Matched_Ids[j]);
        if (!data.length) {
          return;
        }
        const student = data[0];

        if (!Matches.includes(student)) {
          setMatches((prev) => [...prev, student]);
        }
      }
    };
    if (resultPage) {
      show_result();
    }
  }, [resultPage]);

  return (
    <VStack
      className={styles.box}
      backgroundImage={useColorModeValue(
        'url(/bg2.png)', // Light theme image
        'url(/bgdark.jpg)' // Dark theme image
      )}
      backgroundSize={{ base: 'none', md: 'cover' }}
    >
      <Clear />
      <Stack
        direction={{ base: 'column', md: 'row' }}
        className={styles.dashboard}
      >
        <ProfileSection
          user={user}
          submit={submit}
          submitted={hearts_submitted}
        />
        <MainSection
          clickedStudents={clickedStudents}
          setClickedStudents={setClickedStudents}
          hearts_submitted={hearts_submitted}
          set_hearts_submitted={set_hearts_submitted}
          SendHeart_api={SendHeart_api}
          isResultPage={resultPage}
          matches={Matches}
          selectedSongIds={selectedSongIds}
          setSelectedSongIds={setSelectedSongIds}
        />
        <NewSection />
      </Stack>
      <Clear />
    </VStack>
  );
};

export default dashboard;
