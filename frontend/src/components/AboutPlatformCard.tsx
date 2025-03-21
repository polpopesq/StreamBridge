import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';


interface PlatformCardProps {
  name: string;
  description: string;
  image: any;
}

export default function AboutPlatformCard({ name, description, image }: PlatformCardProps) {
  return (
    <Card sx={{ width: "85%", height: "100%", display: 'flex', flexDirection: 'column' }}>
      <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          image={image}
          alt={image}
          sx={{ objectFit: "contain", flexShrink: 0, maxHeight: 160, paddingTop: 3 }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'secondary', flexGrow: 1 }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
