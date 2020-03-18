import axios from 'axios';
import { setAlert } from './alert';
import { GET_PROFILE, GET_PROFILES, PROFILE_ERROR, UPDATE_PROFILE, ACCOUNT_DELETED, CLEAR_PROFILE, GET_REPOS } from './types';

//GET CURRENT USERS PROFILE

export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/profile/user-profile');

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

//GET ALL PROFILES
export const getProfiles = () => async dispatch => {
    dispatch({ type: CLEAR_PROFILE })

    try {
        const res = await axios.get('/profile/users-profiles');

        dispatch({
            type: GET_PROFILES,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

//GET PROFILE BY ID
export const getProfilesById= userId => async dispatch => {

    try {
        const res = await axios.get(`/profile/user-profile/${userId}`);

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

//GET GITHUB USER
export const getGithubRepos = username => async dispatch => {

    try {
        const res = await axios.get(`/profile/user-profile/github/${username}`);

        dispatch({
            type: GET_REPOS,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

//CREATE OR UPDATE A PROFILE
export const createProfile = (formData, history, edit= false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        }

        const res = await axios.post('/profile/user-profile', formData, config);

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        if(!edit) {
            history.push('/dashboard');
        } else {
            history.push('/dashboard')
        }
    } catch (err) {
        const errors= err.response.data.errors; 

        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
 

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
} 

//ADD EXPERIANCE
export const addExperience= (formData, history) => async dispatch => {
    try {
            const config= {
                headers: {
                        'Content-Type' : 'application/json'}
            } ;

            const res = await axios.put('/profile/user-profile/experience', formData, config);

            dispatch({
                type: UPDATE_PROFILE,
                payload: res.data
            });

            dispatch(setAlert('Experiences Added', 'success'));

            history.push('/dashboard')
    } catch (err) {
                const errors= err.response.data.errors;

                if(errors) {
                    errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
                }
        

                dispatch({
                    type: PROFILE_ERROR,
                    payload: { msg: err.response.statusText, status: err.response.status }
                });
    }
}

//ADD EDUCATION
export const addEducation= (formData, history) => async dispatch => {
    try {
       const config= {
           'Content-Type' : 'application/json'
       } ;

       const res = await axios.put('/profile/user-profile/education', formData, config);

       dispatch({
           type: UPDATE_PROFILE,
           payload: res.data
       });

       dispatch(setAlert('Education Added', 'success'));

       history.push('/dashboard')
    } catch (err) {
        const errors= err.response.data.errors;

        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
 

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}

//DELETE EXPERIANCE

export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/profile/user-profile/experience/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });

        dispatch(setAlert('Experience Removed','success'))
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

//DELETE EDUCATION

export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/profile/user-profile/education/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });

        dispatch(setAlert('Education Removed', 'success'))
    } catch (err) {

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}


//DELETE ACCOUNT
export const deleteAccount = () => async dispatch => {
    if(window.confirm('Are you sure? This cannot be restored!')) {
            try {
               await axios.delete('/profile/user-profile/');
        
                dispatch({type: CLEAR_PROFILE});
                dispatch({type: ACCOUNT_DELETED});
        
                dispatch(setAlert('Your account has been permanantly deleted', 'danger'))
            } catch (err) {
        
                dispatch({
                    type: PROFILE_ERROR,
                    payload: { msg: err.response.statusText, status: err.response.status }
                });
            }
        }
}
