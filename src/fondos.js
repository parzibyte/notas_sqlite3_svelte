import image1 from "../static/images/1.png";
import image2 from "../static/images/2.png";
import image3 from "../static/images/3.png";
import image4 from "../static/images/4.png";
import image5 from "../static/images/5.png";
import image6 from "../static/images/6.png";
import image7 from "../static/images/7.png";
import image8 from "../static/images/8.png";
import image9 from "../static/images/9.png";
import image10 from "../static/images/10.png";
import image11 from "../static/images/11.png";
import image12 from "../static/images/12.png";
import image13 from "../static/images/13.png";
import image14 from "../static/images/14.png";
import image15 from "../static/images/15.png";
import image16 from "../static/images/16.png";

export const fondos = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
];


export const resolverFondo = (fondo) => {
  return fondos.find(fondoExistente => fondoExistente.endsWith(fondo));
};