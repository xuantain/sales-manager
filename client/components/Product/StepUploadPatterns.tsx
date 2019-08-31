import React, { useRef } from 'react';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import { useSpring, animated } from 'react-spring';

import services from '../../services';

// Models
import { PATTERN } from "../../models/amz-shirt.strict.model";

import camera512Icon from '../../../assets/img/camera-512.png';
import dropboxIcon from '../../../assets/img/dropbox-icon.png';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      marginLeft: 10,
      marginRight: 5,
      maxWidth: 345,
      width: 250,
      height: 250,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    media: {
      height: 140,
      backgroundSize: 'contain',
    },
    mediaInput: {
      display: 'none',
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridListWrap: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      width: 512,
      height: 384,
    },
  }),
);

interface FadeProps {
  children: React.ReactElement;
  in: boolean;
  onEnter?: () => {};
  onExited?: () => {};
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter();
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited();
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});

const StepUploadPatterns = (props: any) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const inputRef = useRef(null);
  const { patterns, setPatterns, currentPatterns, setcurrentPatterns } = props;
  const [ isOpenDropbox, setIsOpenDropbox] = React.useState(false);
  const [ patternsOnDropbox, setPatternsOnDropbox ] = React.useState<any[]>([]);

  function closeDropboxPopper() {
    setIsOpenDropbox(false);
  }

  const choosePatternsOnDropbox = (e: React.MouseEvent) => {
    e.preventDefault();

    services.dropbox.filesListFolder({
      path: '/patterns'
    }).then(response => {
      console.log('patterns/', response)

      const requestedEntries = response.entries.filter(entry => {
        return (entry['.tag'] === 'file');
      }).map(entry => {
        return {
          path: entry['path_display'],
          size: {'.tag': 'w1024h768'} as DropboxTypes.files.ThumbnailSizeW1024h768,
          format: {'.tag': 'png'} as DropboxTypes.files.ThumbnailFormatPng,
        };
      });

      services.dropbox.filesGetThumbnailBatch({
        entries: requestedEntries as DropboxTypes.files.ThumbnailArg[]
      }).then(response => {
        console.log('patterns/*', response);
        setPatternsOnDropbox(response.entries);
        setIsOpenDropbox(true);
      });
    });
  };

  function choosePatternsFromLocal(e: React.MouseEvent) {
    e.preventDefault();
    inputRef.current.click();
  }

  function onDrop(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const files = e.target.files as FileList;

    Array.from(files).forEach((file: File) => {

      let reader = new FileReader();

      reader.onloadend = () => {
        const wasAdded = patterns[file.name] && (patterns[file.name].name === file.name) && (patterns[file.name].lastModified === file.lastModified);

        let newPattern: PATTERN;

        if (wasAdded) {
          newPattern = patterns[file.name];
        } else {
          newPattern = {
            id: Object.keys(patterns).length + 1, // TODO: async so still not get id yet
            src: reader.result,
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            addedAt: Date.now(),
          } as PATTERN;

          setPatterns(patterns => {
            return {...patterns, [file.name]: newPattern};
          });
        }

        setcurrentPatterns([...currentPatterns, newPattern]);
      }

      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      {
        currentPatterns && currentPatterns.length > 0 ? currentPatterns.map((pattern: PATTERN, index: number) => {
          return (
            <Card className={classes.card} key={'pattern-' + index}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={pattern.src.toString()}
                  title={pattern.name}
                />
              </CardActionArea>
            </Card>
          )
        }) : ''
      }
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={camera512Icon}
            title="Upload Patterns"
            onClick={choosePatternsFromLocal}
          />
          <input type="file" accept="image/jpeg, image/png" multiple ref={inputRef}
            className={classes.mediaInput} onChange={(e) => onDrop(e)} />
        </CardActionArea>
      </Card>
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={dropboxIcon}
            title="Get Patterns from Dropbox"
            onClick={choosePatternsOnDropbox}
          />
        </CardActionArea>
      </Card>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        className={classes.modal}
        open={isOpenDropbox}
        onClose={closeDropboxPopper}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isOpenDropbox}>
          <div className={classes.gridListWrap}>
            <GridList className={classes.gridList} cellHeight={160} cols={3}>
              {patternsOnDropbox.map(pattern => (
                <GridListTile key={pattern.metadata.id} cols={1}>
                  <img src={'data:image/jpeg;base64, ' + pattern.thumbnail} alt={pattern.metadata.name} />
                </GridListTile>
              ))}
            </GridList>
          </div>
        </Fade>
      </Modal>
    </>
  );
}

export default StepUploadPatterns;
