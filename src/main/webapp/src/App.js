import { makeStyles, withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import './App.css';
import { IconButton, Paper } from '@material-ui/core';
import {Pie} from 'react-chartjs-2';

//const backendUrl = window.location.protocol + '//' + window.location.hostname;
const backendUrl = 'http://guess-statistics-team5.apps.cluster-54d0.54d0.example.opentlc.com';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 400,
    width: 400
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
    minWidth: 400,
    width: 400
  },
}));

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      loading: false,
      error: false,
      gpList: [],
      gp: '',
      current: null,
      updateDate: ''
    };
    this.colors = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
      .map(i => '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'));
  }

  tick() {
    if (this.state.loading) {
      console.log('Skiping due to in flight call...');
      return;
    }

    let newState = Object.assign({}, this.state);
    newState.loading = true;
    newState.error = null;
    this.setState(newState);

    fetch(encodeURI(backendUrl + '/api/gp'))
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Something went wrong ...');
      }
    })
    .then(data =>{
      let newState = Object.assign({}, this.state);
      newState.loading = false;
      newState.error = null;
      newState.gpList = data;
      newState.updateDate = new Date().toISOString();
      this.setState(newState);

      console.log('Current selected GP is: ' + this.state.gp);

      if (!!this.state.gp && this.state.gp !== '') {

        const url = encodeURI(backendUrl + '/api/gp/' + this.state.gp)

        console.log('Fetching statistics for '+ url);

        fetch(url)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Something went wrong ...');
          }
        })
        .then(data => {
          let newState = Object.assign({}, this.state);
          newState.loading = false;
          newState.error = null;
          newState.current = data.current;
          newState.updateDate = new Date().toISOString();
          this.setState(newState);
        });    
      }
    })
    .catch(error => this.setState(Object.assign({ 
      loading: false,
      error: error,
      gp: '',
    }), this.state));
  }

  setGp(gp) {
    let newState = Object.assign({}, this.state);
    newState.gp = gp;
    newState.current = null;
    this.setState(newState);
  }

  componentDidMount() {
    this.interval = setInterval(() => { 
      this.tick();
    } , 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getColor() {
    return this.colors;
  }

  render() {
    const { loading, error, gpList, gp, current, updateDate } = this.state;
    const { classes } = this.props;

    if (error) {
      return <p>{error.message}</p>;
    }

    let Graph = null;

    if (!!current) {
      const data = {
        labels: current.map(i => i.driver),
        datasets: [{
          data: current.map(i => i.count),
          backgroundColor: this.getColor(),
          hoverBackgroundColor: this.getColor()
        }]
      }

      Graph = (<Grid item xs={12}>
        <Paper className={classes.paper}>
          <Container item xs={12}>
            <div style={{padding: 10}}>
              <Pie data={data} />
            </div>
          </Container>
        </Paper>
      </Grid>);
    }
 
    const onGpChange = (event) => {
      this.setGp(event.target.value);
    }

    return (
      <div className={classes.root}>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Guess Statistics
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{marginTop: 30}}>
          <Container maxWidth="sm" className={classes.contents}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <div style={{padding: 10, width: 400}}>
                    <FormControl className={classes.formControl}>
                      <InputLabel id="gp-select-label">GP</InputLabel>
                      <Select
                        labelId="gp-select-label"
                        id="gp-select"
                        value={gp}
                        onChange={onGpChange}
                        className={classes.selectEmpty}>
                          <MenuItem value={''}>-- None Selected --</MenuItem>
                          {gpList.map((item,index) =>
                            <MenuItem key={item} value={item}>{item}</MenuItem>
                          )}
                      </Select>
                      <Typography gutterBottom variant="overline" style={{width: 530, textAlign: 'right'}}>
                        {loading ? '(Updating...)' : '(Latest update: ' + updateDate + ')'}
                      </Typography>                    
                    </FormControl>
                  </div>
                </Paper>
              </Grid>
              {Graph}
            </Grid>
          </Container>
        </div>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
