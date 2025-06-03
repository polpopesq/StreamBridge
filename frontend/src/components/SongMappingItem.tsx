import { useState } from 'react';
import {
    Tooltip,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Mapping, TrackUI } from '@shared/types';
import MatchManualDialog from './MatchManualDialog';

interface Props {
    mapping: Mapping;
    onUpdateMapping: (updated: Mapping) => void;
};

export default function SongMappingItem({ mapping, onUpdateMapping }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="Match manually">
                <IconButton onClick={() => setOpen(true)}>
                    <SearchIcon />
                </IconButton>
            </Tooltip>

            <MatchManualDialog
                open={open}
                onClose={(chosenMapping: Mapping) => {
                    onUpdateMapping(chosenMapping);
                    setOpen(false);
                }}
                initialMapping={mapping}
            />
        </>
    );
}
