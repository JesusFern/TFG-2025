interface FormatoPesoProps {
  peso: number;
}

export const FormatoPeso = ({ peso }: FormatoPesoProps) => {
  return peso > 0 ? `${peso}kg` : 'Sin peso';
};

export default FormatoPeso;
